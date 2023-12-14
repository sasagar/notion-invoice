import { plain_text } from "@/app/(screen)/_utils/properties/plain_text"

const CustomerInfo = ({ customer }) => {
    if (plain_text(customer.properties['会社情報'])) {
        return (
            <p className="text whitespace-pre-wrap">{plain_text(customer.properties['会社情報'])}</p>
        )
    }
}

export default CustomerInfo;