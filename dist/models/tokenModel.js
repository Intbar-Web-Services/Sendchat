import mongoose from "mongoose";
const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: String,
}, { timestamps: true });
const Token = mongoose.model("Token", tokenSchema);
export default Token;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2tlbmQvbW9kZWxzL3Rva2VuTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBRWhDLE1BQU0sV0FBVyxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FDdEM7SUFDQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7SUFDN0QsS0FBSyxFQUFFLE1BQU07Q0FDYixFQUNELEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUNwQixDQUFDO0FBRUYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFbkQsZUFBZSxLQUFLLENBQUMifQ==