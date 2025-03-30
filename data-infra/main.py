from fastapi import FastAPI
from routers.autorouter import ROUTERS

app = FastAPI()

for router in ROUTERS:
    print(router.prefix)
    app.include_router(router)

@app.get("/ping")
def pong():
    return {"ping": "pong!"}