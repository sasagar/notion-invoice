import { parseISO, format } from 'date-fns';
import { ja } from 'date-fns/locale';

const dateFormat = date => {
  return format(parseISO(date), 'yyyy年MMMdo (eeeee)', { locale: ja });
};

export default dateFormat;
