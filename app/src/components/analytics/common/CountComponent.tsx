import React from 'react';

type CountComponentProps  = {
  count: number
}

export const CountComponent = ({ count }: CountComponentProps) => {
  return <span className="font-semibold">{count}</span>;
}
