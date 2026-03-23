import { appRouter } from "@papaya-fleet/api/routers";
import type { Session, User } from "@papaya-fleet/auth";

// Create a mock authenticated context for testing protected procedures
export function createTestContext(user?: Partial<User>, session?: Partial<Session>) {
  const mockUser: User = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...user,
  };

  const mockSession: Session = {
    id: "test-session-id",
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
    ...session,
    user: mockUser,
  };

  // Create a caller with mocked auth context
  const caller = appRouter.createCaller({
    session: mockSession,
    headers: new Headers(),
  });

  return {
    caller,
    user: mockUser,
    session: mockSession,
  };
}

// Create an unauthenticated context for testing public procedures
export function createPublicContext() {
  const caller = appRouter.createCaller({
    session: null,
    headers: new Headers(),
  });

  return {
    caller,
    user: null,
    session: null,
  };
}
