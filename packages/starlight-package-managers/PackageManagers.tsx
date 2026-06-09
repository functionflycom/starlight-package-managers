import React, { useState } from 'react'

export type PackageManagersProps = {
  pkg?: string
  pkgManagers?: PackageManager[]
  type?: CommandType
  args?: string
  comment?: string
  dev?: boolean
  prefix?: string
  frame?: 'none' | 'terminal'
  icons?: boolean
  title?: string
}

type CommandType = 'add' | 'create' | 'dlx' | 'exec' | 'install' | 'remove' | 'run'
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'deno' | 'ni'

const pkgManagers = ['npm', 'yarn', 'pnpm', 'bun', 'deno', 'ni'] as const
const defaultPkgManagers: PackageManager[] = ['npm', 'pnpm', 'yarn']

const commands: Record<PackageManager, Record<string, string>> = {
  npm: {
    add: 'npm i',
    create: 'npm create',
    dlx: 'npx',
    exec: 'npx',
    install: 'npm install',
    remove: 'npm uninstall',
    run: 'npm run',
  },
  yarn: {
    add: 'yarn add',
    create: 'yarn create',
    dlx: 'yarn dlx',
    exec: 'yarn',
    install: 'yarn install',
    remove: 'yarn remove',
    run: 'yarn run',
  },
  pnpm: {
    add: 'pnpm add',
    create: 'pnpm create',
    dlx: 'pnpx',
    exec: 'pnpm',
    install: 'pnpm install',
    remove: 'pnpm remove',
    run: 'pnpm run',
  },
  bun: {
    add: 'bun add',
    create: 'bun create',
    dlx: 'bunx',
    exec: 'bunx',
    install: 'bun install',
    remove: 'bun remove',
    run: 'bun run',
  },
  deno: {
    add: 'deno add',
    create: 'deno add',
    dlx: 'deno x',
    exec: 'deno x',
    install: 'deno install',
    remove: 'deno remove',
    run: 'deno task',
  },
  ni: {
    add: 'ni',
    create: 'ni',
    dlx: 'nlx',
    exec: 'nlx',
    install: 'ni',
    remove: 'nun',
    run: 'nr',
  },
}

const icons: Record<PackageManager, string | undefined> = {
  npm: '📦',
  yarn: '🧶',
  pnpm: '📦',
  bun: '⚡',
  deno: '🦕',
  ni: '➡️',
}

function getCommand(
  pkgManager: PackageManager,
  type: CommandType,
  pkg: string | undefined,
  options: { args?: string; comment?: string; dev?: boolean; prefix?: string }
): string {
  let command = commands[pkgManager][type]

  if (options.prefix) {
    command = `${options.prefix} ${command}`
  }

  if (options.comment) {
    command = `# ${options.comment.replaceAll('{PKG}', pkgManager)}\n${command}`
  }

  if (type === 'add' && options.dev) {
    command += ` -D`
  }

  if (pkg) {
    const processedPkg = type === 'create' && pkgManager === 'yarn' ? pkg.replace(/@[^\s]+/, '') : pkg
    command += ` ${processedPkg}`
  }

  if (options.args && options.args.length > 0) {
    if (pkgManager === 'npm' && type !== 'dlx' && type !== 'exec' && type !== 'run') {
      command += ' --'
    }
    command += ` ${options.args}`
  }

  return command
}

function getSupportedPkgManagers(type: CommandType, userPkgManagers: PackageManager[] | undefined) {
  return (userPkgManagers ?? defaultPkgManagers).filter(
    (pkgManager) => commands[pkgManager][type] !== undefined
  )
}

interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
  frame?: 'none' | 'terminal'
}

function CodeBlock({ code, lang = 'sh', title, frame = 'terminal' }: CodeBlockProps) {
  const isTerminal = frame === 'terminal'

  return (
    <div
      style={{
        backgroundColor: isTerminal ? '#1e1e2e' : '#282a36',
        borderRadius: isTerminal ? '6px' : '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '14px',
        margin: '16px 0',
      }}
    >
      {title && (
        <div
          style={{
            backgroundColor: '#313244',
            padding: '8px 16px',
            borderBottom: '1px solid #45475a',
            color: '#cdd6f4',
            fontSize: '12px',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <pre
          style={{
            margin: 0,
            color: '#cdd6f4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

export default function PackageManagers({
  pkg,
  pkgManagers,
  type = 'add',
  args,
  comment,
  dev,
  prefix,
  frame = 'terminal',
  icons: showIcons = true,
  title,
}: PackageManagersProps) {
  const [activeTab, setActiveTab] = useState<PackageManager | null>(null)
  const supportedPkgManagers = getSupportedPkgManagers(type, pkgManagers)
  const options = { args, comment, dev, prefix }

  if (supportedPkgManagers.length === 0) {
    return null
  }

  if (supportedPkgManagers.length === 1) {
    const pkgManager = supportedPkgManagers[0]
    const command = getCommand(pkgManager, type, pkg, options)
    return <CodeBlock code={command} lang="sh" title={title} frame={frame} />
  }

  const currentCmd = activeTab
    ? getCommand(activeTab, type, pkg, options)
    : getCommand(supportedPkgManagers[0], type, pkg, options)

  return (
    <div style={{ margin: '16px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          backgroundColor: '#313244',
          padding: '4px',
          borderRadius: '8px 8px 0 0',
          overflow: 'auto',
        }}
      >
        {supportedPkgManagers.map((pkgManager) => (
          <button
            key={pkgManager}
            onClick={() => setActiveTab(pkgManager)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === pkgManager || (!activeTab && pkgManager === supportedPkgManagers[0])
                ? '#45475a'
                : 'transparent',
              color: activeTab === pkgManager || (!activeTab && pkgManager === supportedPkgManagers[0])
                ? '#cdd6f4'
                : '#6c7086',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {showIcons && icons[pkgManager] && <span>{icons[pkgManager]}</span>}
            <span>{pkgManager}</span>
          </button>
        ))}
      </div>
      <CodeBlock code={currentCmd} lang="sh" title={title} frame={frame} />
    </div>
  )
}

export type { PackageManager, CommandType, CommandOptions } from './pkg'
