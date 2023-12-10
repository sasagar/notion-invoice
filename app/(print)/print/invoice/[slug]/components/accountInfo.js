import { plain_text } from "@/app/(screen)/utils/properties/plain_text"

const AccountInfo = ({ account }) => {
    if (plain_text(account.properties['会社情報'])) {
        return (
            <p className="text whitespace-pre-wrap">{plain_text(account.properties['会社情報'])}</p>
        )
    }
}

export default AccountInfo;