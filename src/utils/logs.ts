import * as fs from 'fs';
import * as path from 'path';

export function getLogFilePath(): string {
  const projectRoot = process.cwd();
  const logsDirectory = path.join(projectRoot, 'logs');

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
  } 
  
  const currentDate = new Date();
  const logFileName = `app-${currentDate.toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDirectory, logFileName);

  return logFilePath;
}
