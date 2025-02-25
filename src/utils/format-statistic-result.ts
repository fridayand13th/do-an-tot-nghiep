export function formatStatisticData(data: Array<any>, month: number) {
  let result = [];
  data.forEach((item) => {
    result.push(item);
  });

  const values = result.map((item) => ({
    x: month ? String(item.day) : String(item.month),
    y: Number(item.total) > 0 ? Number(item.total) : Number(item.total) * -1,
  }));

  return values.sort((a, b) => {
    return Number(a.x) - Number(b.x);
  });
}

export function mapUniqeXValue(data: Array<any>) {
  const allXValues = Array.from(new Set(data.flatMap((item) => item.values.map((v) => v.x)))).sort((a, b) => {
    return Number(a) - Number(b);
  });

  return data.map((item) => ({
    ...item,
    values: allXValues.map((x) => {
      const value = item.values.find((v) => v.x === x);
      return { x, y: value ? value.y : 0 };
    }),
  }));
}

export function addMissingValue(data: Array<any>, month: number, day: number) {
  if (data.length === 0) {
    return [];
  }
  let values = formatStatisticData(data, month);
  let xValues = new Set(values.map((e) => Number(e.x)));

  let missingValue = [];

  if (!month) {
    for (let i = 1; i <= 12; i++) {
      if (!xValues.has(i)) {
        missingValue.push(i);
      }
    }
  } else if (month && !day) {
    for (let i = 1; i <= 31; i++) {
      if (!xValues.has(i)) {
        missingValue.push(i);
      }
    }
  } else if (month && day) {
    for (let i = 1; i <= day; i++) {
      if (!xValues.has(i)) {
        missingValue.push(i);
      }
    }
  }

  missingValue.forEach((e) => {
    values.push({ x: e, y: 0 });
  });

  return values
    .map((item) => ({
      x: Number(item.x),
      y: item.y,
    }))
    .sort((a, b) => Number(a.x) - Number(b.x));
}
