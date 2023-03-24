export function swapItemsAt(items, index1, index2) {
  const lastIndex = items.length - 1;
  if (index1 < 0 || index2 < 0 || index1 > lastIndex || index2 > lastIndex || index1 === index2) {
    return items;
  }

  const result = items.slice();

  const item1 = result[index1];
  const item2 = result[index2];
  result[index1] = item2;
  result[index2] = item1;
  return result;
}

export function removeItemAt(items, index) {
  const lastIndex = items.length - 1;
  if (index < 0 || index > lastIndex) {
    return items;
  }

  return items.filter((t, i) => i !== index);
}
