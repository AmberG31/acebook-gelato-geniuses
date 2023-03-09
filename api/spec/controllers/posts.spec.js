const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
require("../mongodb_helper");
const Post = require("../../models/post");
const User = require("../../models/user");

let token;

const generateBackdatedToken = (userId) =>
  jwt.sign(
    {
      userId,
      // Backdate this token of 5 minutes
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      // Set the JWT token to expire in 10 minutes
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    process.env.JWT_SECRET
  );

describe("/posts", () => {
  beforeAll(async () => {
    const user = new User({
      username: "testuser",
      email: "test@test.com",
      password: "12345678",
    });
    await user.save();
    token = generateBackdatedToken(user.id);
  });

  beforeEach(async () => {
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("POST, when token is present", () => {
    test("responds with a 201", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "hello world", token });
      expect(response.status).toEqual(201);
    });

    test("creates a new post", async () => {
      await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "hello world", token });
      const posts = await Post.find();
      expect(posts.length).toEqual(1);
      expect(posts[0].message).toEqual("hello world");
    });

    test("returns a new token", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "hello world", token });
      const newPayload = jwt.decode(
        response.body.token,
        process.env.JWT_SECRET
      );
      const originalPayload = jwt.decode(token, process.env.JWT_SECRET);
      expect(newPayload.iat > originalPayload.iat).toEqual(true);
    });
  });

  describe("POST, when token is missing", () => {
    test("responds with a 401", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ message: "hello again world" });
      expect(response.status).toEqual(401);
    });

    test("a post is not created", async () => {
      await request(app).post("/posts").send({ message: "hello again world" });
      const posts = await Post.find();
      expect(posts.length).toEqual(0);
    });

    test("a token is not returned", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ message: "hello again world" });
      expect(response.body.token).toEqual(undefined);
    });
  });

  describe("GET, when token is present", () => {
    test("returns every post in the collection", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ token });
      const messages = response.body.posts.map((post) => post.message);
      expect(messages).toEqual(["howdy!", "hola!"]);
    });

    test("the response code is 200", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ token });
      expect(response.status).toEqual(200);
    });

    test("returns a new token", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ token });
      const newPayload = jwt.decode(
        response.body.token,
        process.env.JWT_SECRET
      );
      const originalPayload = jwt.decode(token, process.env.JWT_SECRET);
      expect(newPayload.iat > originalPayload.iat).toEqual(true);
    });
  });

  describe("GET, when token is missing", () => {
    test("returns no posts", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app).get("/posts");
      expect(response.body.posts).toEqual(undefined);
    });

    test("the response code is 401", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app).get("/posts");
      expect(response.status).toEqual(401);
    });

    test("does not return a new token", async () => {
      const post1 = new Post({ message: "howdy!" });
      const post2 = new Post({ message: "hola!" });
      await post1.save();
      await post2.save();
      const response = await request(app).get("/posts");
      expect(response.body.token).toEqual(undefined);
    });
  });
});
