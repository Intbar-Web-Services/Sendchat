import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input, Select } from "@chakra-ui/react"; // this is a bunch of imports from chakra ui
import { useState } from "react"; // this is a hook that allows you to use state in a functional component
import useShowToast from "../hooks/useShowToast";

const ModerationMenu = ({ id, isOpen, onClose }) => { // this is a functional component that takes isOpen and onClose as props
    const [punishment, setPunishment] = useState(""); // this is a state variable that stores the type of punishment
    const [hours, setHours] = useState(0); // this is a state variable that stores the number of hours for the punishment
    const [reason, setReason] = useState(""); // this is a state variable that stores the reason for the punishment
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const handleSubmit = async () => {
        setLoading(true);
        const hoursParsedDate = Math.floor(new Date().getTime() / 1000.0)
        if (punishment === "suspend") {
            if (hours !== 0) {
                const hours1 = Math.floor(new Date().getTime() / 1000.0);
                const hoursParsed = Number(hours1) + Number(hours);
                const res = await fetch(`/api/punishments/suspend/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hoursParsed, reason }),
                })
                setLoading(false);
                if (res.error) return showToast("Error", res.error, "error");
                showToast("Success", `You suspended ${id} for ${Number(hours) / 3600} hour${(Number(hours) == 3600) ? ("") : ("s")}`, "success");
                onClose();
            } else {
                showToast("Warning", "You must select an amount of time to suspend!", "warning");
                setLoading(false);
            }
        } else if (punishment === "warn") {
            const res = await fetch(`/api/punishments/warn/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            })

            setLoading(false);
            if (res.error) return showToast("Error", res.error, "error");
            showToast("Success", `You warned ${id} successfully`, "success");
            onClose();
        } else if (punishment === "ban") {
            const res = await fetch(`/api/punishments/ban/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason, hoursParsedDate }),
            })

            setLoading(false);
            if (res.error) return showToast("Error", res.error, "error");
            showToast("Success", `You banned ${id} successfully`, "success");
            onClose();
        } else {
            showToast("Warning", "You must select a punishment type!", "warning");
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Moderate User</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select placeholder="Select punishment" onChange={(e) => setPunishment(e.target.value)}>
                        <option value="warn">Warn</option>
                        <option value="suspend">Suspend</option>
                        <option value="ban">Ban</option>
                    </Select>
                    {punishment === "suspend" && (
                        <Select placeholder="Select time" onChange={(e) => setHours(e.target.value)}>
                            <option value={3600}>1 hour</option>
                            <option value={18000}>5 hours</option>
                            <option value={259200}>3 days</option>
                        </Select>
                    )}
                    <Input placeholder={`Moderation reason for: ${id}`} onChange={(e) => setReason(e.target.value)} />
                    <Button isLoading={loading} onClick={handleSubmit}>Submit</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModerationMenu;