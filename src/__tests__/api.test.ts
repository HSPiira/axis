import { POST } from "../app/api/users/route";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library";
import { prisma } from "@/lib/db";

jest.mock("../middleware/check-permission", () => ({
  withPermission: () => (handler: any) => handler,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/users", () => {
    it("should create a new user successfully", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: "new-user-id",
        email: "new@example.com",
        name: "New User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: "new@example.com",
          name: "New User",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data.email).toBe("new@example.com");
      expect(data.name).toBe("New User");
    });

    it("should return 409 when creating a user with existing email", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValueOnce({
        code: "P2002",
        message: "Unique constraint violation",
      });
      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("User with this email already exists");
    });

    it("should return 500 when an unexpected error occurs", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValueOnce(
        new Error("Unexpected error")
      );

      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: "error@example.com",
          name: "Error User",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request as any);
      const data = await response.json();

      if (response.status !== 500 || data.error !== "Failed to create user") {
        // Print debug info if the test fails
        console.error("--- TEST DEBUG ---");
        console.error("Actual status:", response.status);
        console.error("Actual data:", data);
        console.error("------------------");
      }

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create user");
    });
  });
});
