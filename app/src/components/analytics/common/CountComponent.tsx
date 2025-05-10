import React from 'react';

type CountComponentProps  = {
  count: number
}

const CountComponent = (props: CountComponentProps) => {
  return <span className="font-semibold">{props.count}</span>;
};

export default CountComponent;
