export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Handle unhandled rejections for HMR ping errors
    process.on('unhandledRejection', (reason: unknown) => {
      // Check if it's an HMR ping error
      const errorMessage =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : typeof reason === "object" &&
                reason !== null &&
                "message" in reason &&
                typeof (reason as { message?: unknown }).message === "string"
              ? (reason as { message: string }).message
              : String(reason ?? "");
      
      if (
        errorMessage.includes('unrecognized HMR message') || 
        errorMessage.includes('{"event":"ping"}') ||
        errorMessage.includes('event":"ping')
      ) {
        // Silently ignore HMR ping errors - these are harmless Turbopack HMR issues
        return;
      }
      
      // For other errors, log them (but don't throw to avoid crashing)
      console.error('Unhandled Rejection:', reason);
    });
  }
}

