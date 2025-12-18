export const plain_text = props => {
  if (!props || !props.type) {
    return '';
  }

  if (props.type === 'title') {
    return props.title?.[0]?.plain_text || '';
  }

  if (props.type === 'status') {
    return props.status?.name || '';
  }

  if (props.type === 'rich_text') {
    return props.rich_text?.[0]?.plain_text || '';
  }

  if (props.type === 'select') {
    return props.select?.name || '';
  }

  return '';
};
