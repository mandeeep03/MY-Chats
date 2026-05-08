import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastRead: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ "members.user": 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ updatedAt: -1 });

roomSchema.statics.findOrCreateDirect = async function (userAId, userBId) {
  const existing = await this.findOne({
    type: "direct",
    "members.user": { $all: [userAId, userBId] },
    $expr: { $eq: [{ $size: "$members" }, 2] },
  }).populate("members.user", "username avatar isOnline lastSeen");

  if (existing) return { room: existing, created: false };

  const room = await this.create({
    type: "direct",
    members: [
      { user: userAId, role: "member" },
      { user: userBId, role: "member" },
    ],
  });

  await room.populate("members.user", "username avatar isOnline lastSeen");
  return { room, created: true };
};

roomSchema.methods.getMemberIds = function () {
  return this.members.map((m) => m.user.toString());
};

roomSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

roomSchema.methods.isAdmin = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );
};

const Room = mongoose.model("Room", roomSchema);
export default Room;
