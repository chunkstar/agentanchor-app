# AI Bot Builder 🤖

A powerful web application for building, managing, and deploying custom AI assistants with MCP (Model Context Protocol) team integration.

## Features

- **Custom AI Bots**: Create AI assistants with custom personalities and system prompts
- **Team Management**: Organize bots into collaborative teams
- **MCP Integration**: Connect bots to external tools and data sources via MCP servers
- **Real-time Chat**: Interactive chat interface with streaming responses
- **Claude AI**: Powered by Anthropic's Claude models
- **Supabase Backend**: Secure authentication and database
- **Vercel Deployment**: Easy deployment and scaling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- Anthropic API key
- Vercel account (for deployment)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fresh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Run the database schema:
      - Go to the SQL Editor in your Supabase dashboard
      - Copy and paste the contents of `supabase/schema.sql`
      - Run the SQL script

   c. Enable Google OAuth (optional):
      - Go to Authentication > Providers
      - Enable Google provider
      - Add your Google OAuth credentials

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Anthropic API
   ANTHROPIC_API_KEY=your-anthropic-api-key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Update Supabase settings**
   - Add your Vercel domain to Supabase Auth > URL Configuration
   - Add redirect URLs for OAuth

## Usage

### Creating a Bot

1. Navigate to "Bots" in the sidebar
2. Click "Create Bot"
3. Fill in:
   - Bot name and description
   - System prompt (defines personality and behavior)
   - Model selection (Claude 3.5 Sonnet, Opus, etc.)
   - Temperature and max tokens
4. Click "Create Bot"

### Creating a Team

1. Navigate to "Teams" in the sidebar
2. Click "Create Team"
3. Add team name and description
4. Select bots to add to the team
5. Click "Create Team"

### Chatting with Bots

1. Navigate to "Dashboard" or "Chat"
2. Select a bot from the sidebar
3. Start typing your message
4. Get real-time streaming responses

### Adding MCP Servers

1. Navigate to "MCP Servers"
2. Click "Add MCP Server"
3. Configure server type and settings
4. Attach to specific bots

## Project Structure

```
fresh/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   ├── bots/                # Bot management pages
│   ├── teams/               # Team management pages
│   ├── chat/                # Chat interface
│   ├── mcp/                 # MCP server management
│   ├── dashboard/           # Dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── bots/                # Bot-specific components
│   └── teams/               # Team-specific components
├── lib/                     # Utility libraries
│   └── supabase/            # Supabase client configs
├── types/                   # TypeScript type definitions
├── supabase/                # Supabase configuration
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## Database Schema

- **profiles**: User profiles
- **bots**: AI bot configurations
- **teams**: Team organizations
- **team_bots**: Bot-team relationships
- **mcp_servers**: MCP server configurations
- **bot_mcp_servers**: Bot-MCP relationships
- **conversations**: Chat conversations
- **messages**: Chat messages

## Features Roadmap

- [ ] Team chat (multiple bots collaborating)
- [ ] Bot marketplace (share public bots)
- [ ] Advanced MCP server types
- [ ] Conversation export
- [ ] Bot analytics and usage stats
- [ ] Voice input/output
- [ ] Image generation integration
- [ ] Custom themes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Claude AI
