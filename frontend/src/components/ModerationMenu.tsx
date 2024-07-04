import { Button, Modal, Flex, VStack, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input, Select } from "@chakra-ui/react"; // this is a bunch of imports from chakra ui
import { useState } from "react"; // this is a hook that allows you to use state in a functional component
import useShowToast from "../hooks/useShowToast";
import getCurrentUserId from "../user.js";

const ModerationMenu = ({ id, isOpen, onClose }: { id: string, isOpen: boolean, onClose: () => void }) => { // this is a functional component that takes isOpen and onClose as props
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
                        "authorization": `Bearer ${await getCurrentUserId()}`,
                    },
                    body: JSON.stringify({ hoursParsed, reason }),
                })

                const data: { success?: string | boolean, error?: string } = await res.json();
                setLoading(false);
                if (data.error) return showToast("Error", data.error, "error");
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
                    "authorization": `Bearer ${await getCurrentUserId()}`,
                },
                body: JSON.stringify({ reason }),
            })
            const data: { success?: string | boolean, error?: string } = await res.json();

            setLoading(false);
            if (data.error) return showToast("Error", data.error, "error");
            showToast("Success", `You warned ${id} successfully`, "success");
            onClose();
        } else if (punishment === "ban") {
            const res = await fetch(`/api/punishments/ban/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "authorization": `Bearer ${await getCurrentUserId()}`,
                },
                body: JSON.stringify({ reason, hoursParsedDate }),
            })
            const data: { success?: string | boolean, error?: string } = await res.json();

            setLoading(false);
            if (data.error) return showToast("Error", data.error, "error");
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
                    <VStack>
                        <Select placeholder="Select punishment" onChange={(e) => setPunishment(e.target.value)}>
                            <option value="warn">Warn</option>
                            <option value="suspend">Suspend</option>
                            <option value="ban">Ban</option>
                        </Select>
                        {punishment === "suspend" && (
                            <Select placeholder="Select time" onChange={(e) => setHours(+e.target.value)}>
                                <option value={3600}>1 hour</option>
                                <option value={18000}>5 hours</option>
                                <option value={259200}>3 days</option>
                            </Select>
                        )}
                        <Input placeholder={`Moderation reason for: ${id}`} onChange={(e) => setReason(e.target.value)} />
                        <Flex w="100%" gap="255" marginBottom={3}>
                            <Button onClick={onClose} alignSelf="start">Cancel</Button>
                            <Button isLoading={loading} alignSelf="end" onClick={handleSubmit}>Submit</Button>
                        </Flex>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModerationMenu;