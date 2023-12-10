import { parseISO, format } from 'date-fns'
import ja from 'date-fns/locale/ja'

const dateTimeFormat = (dateTime) => {
    return format(parseISO(dateTime), 'yyyy年MMMdo (eeeee) HH:mm:ss', { locale: ja })
}

export default dateTimeFormat;