import { plain_text } from "@/app/(screen)/_utils/properties/plain_text"

const CustomerPerson = ({ customer }) => {
    if (plain_text(customer.properties['担当者名'])) {
        return (
            <p className="text whitespace-pre-wrap">ご担当: {plain_text(customer.properties['担当者名'])}</p>
        )
    }
}

export default CustomerPerson;