import { Request, Response } from "express"

const probe = async (req: Request, res) => {
    return res.status(200).json({ message: 'prorororororororoorororrobe' })
}