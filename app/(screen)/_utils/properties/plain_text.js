export const plain_text = props => {
  if (props.type) {
    if (props.type === 'title') {
      return props.title[0].plain_text;
    }

    if (props.type === 'status') {
      return props.status.name;
    }

    if (props.type === 'rich_text') {
      if (props.rich_text[0]) {
        return props.rich_text[0].plain_text;
      }
    } else if (props.type === 'select') {
      if (props.select !== null) {
        return props.select.name;
      }
      return null;
    }
  }
};
