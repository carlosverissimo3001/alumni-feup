import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.session import session_scope
from app.pipeline.runs import create_run, ensure_stages
from app.pipeline.stages import PipelineKind, PipelineStageName
from app.schemas.job_classification import AlumniJobClassificationParams, EscoResult
from app.tasks.queue import task_queue
from app.utils.agents.esco_reference import search_esco_classifications

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def classify_job(
    params: AlumniJobClassificationParams = Depends(),
):
    """
    Trigger the classification of the roles of the alumni

    If none are provided, it will update all alumni roles.
    """
    try:
        logger.info(f"Requesting alumni role classification for {params.alumni_ids}")

        with session_scope() as db:
            run = create_run(
                db,
                kind=PipelineKind.REFRESH_EXISTING,
                params={"alumni_ids": params.alumni_ids},
            )
            db.flush()
            ensure_stages(db, run)
            run_id = run.id
            # session_scope does not commit. Without this the run is gone by the
            # time the worker looks for it, and run_stage finds nothing.
            db.commit()

        await task_queue.enqueue(
            "run_stage", run_id=run_id, stage=PipelineStageName.CLASSIFY_ROLES.value
        )
        return {"run_id": run_id}

    except Exception as e:
        logger.error(f"Error requesting alumni role classification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error requesting alumni role classification",
        )


@router.post(
    "/raw",
    response_model=List[EscoResult],
    status_code=status.HTTP_201_CREATED,
)
async def classify_job_raw(query: str):
    """
    Test endpoint that takes in a query (some job title and description) and returns a
    list of ESCO classifications.
    """
    try:
        logger.info(f"Classifying job {query}")

        results = await search_esco_classifications.ainvoke(query)
        return results

    except Exception as e:
        logger.error(f"Error classifying job title: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error classifying job title: {str(e)}",
        )
