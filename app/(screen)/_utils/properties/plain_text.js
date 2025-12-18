export const plain_text = props => {
  if (!props || !props.type) {
    return '';
  }

  if (props.type === 'title') {
    // 全てのtitle要素を結合
    return props.title?.map(t => t.plain_text).join('') || '';
  }

  if (props.type === 'status') {
    return props.status?.name || '';
  }

  if (props.type === 'rich_text') {
    // 全てのrich_text要素を結合
    return props.rich_text?.map(t => t.plain_text).join('') || '';
  }

  if (props.type === 'select') {
    return props.select?.name || '';
  }

  return '';
};
