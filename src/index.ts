import { MCPServer } from "mcp-framework";
import { gitLabService } from "./services/GitLabService";

const server = new MCPServer();

// 服务器会自动发现 src/tools/ 目录下的所有工具
server.start();