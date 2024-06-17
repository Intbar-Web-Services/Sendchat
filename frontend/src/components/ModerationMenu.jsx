import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input, Select } from "@chakra-ui/react"; // this is a bunch of imports from chakra ui
import { useState } from "react"; // this is a hook that allows you to use state in a functional component

const ModerationMenu = ({ id, isOpen, onClose }) => { // this is a functional component that takes isOpen and onClose as props
    const [punishment, setPunishment] = useState(""); // this is a state variable that stores the type of punishment
    const [hours, setHours] = useState(0); // this is a state variable that stores the number of hours for the punishment
    const [reason, setReason] = useState(""); // this is a state variable that stores the reason for the punishment
    const handleSubmit = async () => {
        const hoursParsed = Date.now() + hours;

        switch (punishment) {
            case ("suspend"): {
                const res = await fetch(`/api/punishments/suspend/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hoursParsed, reason }),
                })
            }
            case ("warn"): {
                const res = await fetch(`/api/punishments/warn/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hoursParsed, reason }),
                })
            }
        };
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>that guy menu</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select placeholder="Select punishment" onChange={(e) => setPunishment(e.target.value)}>
                        <option value="warn">Warn</option>
                        <option value="suspend">Suspend</option>
                        <option value="ban">Ban</option>
                    </Select>
                    {punishment === "suspend" && (
                        <Select placeholder="Select hours" onChange={(e) => setHours(e.target.value)}>
                            <option value={3600}>1 hour</option>
                            <option value={18000}>5 hours</option>
                            <option value={259200}>3 days</option>
                        </Select>
                    )}
                    <Input placeholder="i'm over here stroking my cat my cat is on my lap i'm stroking his back" onChange={(e) => setReason(e.target.value)} />
                    <Button onClick={handleSubmit}>Submit</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModerationMenu;