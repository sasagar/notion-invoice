import { SlDoc } from "react-icons/sl";
import Link from "next/link";

const InvoiceLink = (props) => {
    return (
        <Link href={`/invoice/item/${props.number}`} className="text-sm">
            <SlDoc /> {props.number}
        </Link>
    )
}

export default InvoiceLink;