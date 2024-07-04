import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        maxLength: 500,
    },
    img: {
        type: String,
    },
    likes: {
        // array of user ids
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    replies: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            userProfilePic: {
                type: String,
            },
            username: {
                type: String,
            },
            name: {
                type: String,
            }
        },
    ],
}, {
    timestamps: true,
});
const Post = mongoose.model("Post", postSchema);
export default Post;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmFja2VuZC9tb2RlbHMvcG9zdE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQztBQUVoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQ3JDO0lBQ0MsUUFBUSxFQUFFO1FBQ1QsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVE7UUFDcEMsR0FBRyxFQUFFLE1BQU07UUFDWCxRQUFRLEVBQUUsSUFBSTtLQUNkO0lBQ0QsSUFBSSxFQUFFO1FBQ0wsSUFBSSxFQUFFLE1BQU07UUFDWixTQUFTLEVBQUUsR0FBRztLQUNkO0lBQ0QsR0FBRyxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07S0FDWjtJQUNELEtBQUssRUFBRTtRQUNOLG9CQUFvQjtRQUNwQixJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDdEMsR0FBRyxFQUFFLE1BQU07UUFDWCxPQUFPLEVBQUUsRUFBRTtLQUNYO0lBQ0QsT0FBTyxFQUFFO1FBQ1I7WUFDQyxNQUFNLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVE7Z0JBQ3BDLEdBQUcsRUFBRSxNQUFNO2dCQUNYLFFBQVEsRUFBRSxJQUFJO2FBQ2Q7WUFDRCxJQUFJLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLE1BQU07Z0JBQ1osUUFBUSxFQUFFLElBQUk7YUFDZDtZQUNELGNBQWMsRUFBRTtnQkFDZixJQUFJLEVBQUUsTUFBTTthQUNaO1lBQ0QsUUFBUSxFQUFFO2dCQUNULElBQUksRUFBRSxNQUFNO2FBQ1o7WUFDRCxJQUFJLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLE1BQU07YUFDWjtTQUNEO0tBQ0Q7Q0FDRCxFQUNEO0lBQ0MsVUFBVSxFQUFFLElBQUk7Q0FDaEIsQ0FDRCxDQUFDO0FBRUYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFaEQsZUFBZSxJQUFJLENBQUMifQ==