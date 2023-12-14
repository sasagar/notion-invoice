import { SlCheck, SlEnvolopeLetter, SlPencil } from "react-icons/sl";

const StatusTag = (props) => {
    const stat = props.status;

    if (stat === "ドラフト") {
        return (
            <span className="flex items-center gap-3 px-3 py-1 rounded-full border border-lime-600 bg-lime-800 text-sm w-fit">
                <SlPencil />{stat}
            </span>
        )
    } else if (stat === "送付済み") {
        return (
            <span className="flex items-center gap-3 px-3 py-1 rounded-full border border-amber-600 bg-amber-800 text-sm w-fit">
                <SlEnvolopeLetter />{stat}
            </span>
        )
    } else {
        return (
            <span className="flex items-center gap-3 px-3 py-1 rounded-full border border-blue-600 bg-blue-800 text-sm w-fit">
                <SlCheck />{stat}
            </span>
        )
    }

}

export default StatusTag;