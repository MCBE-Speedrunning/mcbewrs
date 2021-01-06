declare namespace Express {
	interface Request {
		user: any;
		username: string;
		session: Session;
	}
	interface Session {
		user: any;
		success: string;
		error: string;
		regenerate(fn: () => void): Callback;
		destroy(fn: () => void): Callback;
	}
	interface Callback {
		(): void;
	}
}
