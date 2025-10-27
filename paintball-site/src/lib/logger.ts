export type LogTag = "[BOOKING]" | "[EMAIL]" | "[SHEETS]";

export type LogLevel = "info" | "warn" | "error";

export type LogMetadata = Record<string, unknown> | undefined;

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  tag: LogTag;
  message: string;
  metadata?: LogMetadata;
};

const remoteEndpoint = process.env.LOGGER_REMOTE_ENDPOINT;
const remoteApiKey = process.env.LOGGER_REMOTE_API_KEY;

function logToConsole(entry: LogEntry) {
  const { level, tag, message, metadata } = entry;
  const formatted = `${tag} ${message}`;

  if (level === "error") {
    if (metadata) {
      console.error(formatted, metadata);
    } else {
      console.error(formatted);
    }
    return;
  }

  if (level === "warn") {
    if (metadata) {
      console.warn(formatted, metadata);
    } else {
      console.warn(formatted);
    }
    return;
  }

  if (metadata) {
    console.log(formatted, metadata);
  } else {
    console.log(formatted);
  }
}

async function logToRemote(entry: LogEntry) {
  if (!remoteEndpoint) {
    return;
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (remoteApiKey) {
      headers.Authorization = `Bearer ${remoteApiKey}`;
    }

    await fetch(remoteEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.warn(`${entry.tag} Failed to send remote log.`, error);
  }
}

async function emit(level: LogLevel, tag: LogTag, message: string, metadata?: LogMetadata) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    tag,
    message,
    metadata,
  };

  logToConsole(entry);
  await logToRemote(entry);
}

export const logger = {
  info(tag: LogTag, message: string, metadata?: LogMetadata) {
    return emit("info", tag, message, metadata);
  },
  warn(tag: LogTag, message: string, metadata?: LogMetadata) {
    return emit("warn", tag, message, metadata);
  },
  error(tag: LogTag, message: string, metadata?: LogMetadata) {
    return emit("error", tag, message, metadata);
  },
};
