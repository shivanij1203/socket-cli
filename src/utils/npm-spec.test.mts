import { describe, expect, it } from 'vitest'

import { safeNpmSpecToPurl, safeParseNpmSpec } from './npm-spec.mts'

describe('safeParseNpmSpec', () => {
  it('parses a plain version spec', () => {
    expect(safeParseNpmSpec('lodash@4.17.21')).toEqual({
      name: 'lodash',
      version: '4.17.21',
    })
  })

  it('parses a scoped version spec', () => {
    expect(safeParseNpmSpec('@types/node@20.0.0')).toEqual({
      name: '@types/node',
      version: '20.0.0',
    })
  })

  it('parses a bare name with no version', () => {
    expect(safeParseNpmSpec('lodash')).toEqual({
      name: 'lodash',
      version: undefined,
    })
  })

  it('resolves an alias to the aliased package', () => {
    expect(safeParseNpmSpec('my-lodash@npm:lodash@4.17.21')).toEqual({
      name: 'lodash',
      version: '4.17.21',
    })
  })

  it('resolves a scoped alias to the aliased package', () => {
    expect(safeParseNpmSpec('node-types@npm:@types/node@20.0.0')).toEqual({
      name: '@types/node',
      version: '20.0.0',
    })
  })

  it('resolves an alias with a range (package.json form)', () => {
    expect(safeParseNpmSpec('my-lodash@npm:lodash@^4')).toEqual({
      name: 'lodash',
      version: '^4',
    })
  })

  it('resolves an alias with no version', () => {
    expect(safeParseNpmSpec('my-react@npm:react')).toEqual({
      name: 'react',
      version: undefined,
    })
  })
})

describe('safeNpmSpecToPurl', () => {
  it('scans the aliased package, not the alias label', () => {
    // #1655: an alias must scan the aliased package, not the alias label.
    expect(safeNpmSpecToPurl('my-lodash@npm:lodash@4.17.21')).toBe(
      safeNpmSpecToPurl('lodash@4.17.21'),
    )
    expect(safeNpmSpecToPurl('my-lodash@npm:lodash@4.17.21')).toContain(
      'lodash@4.17.21',
    )
    expect(safeNpmSpecToPurl('my-lodash@npm:lodash@4.17.21')).not.toContain(
      'my-lodash',
    )
  })

  it('resolves a scoped alias to the aliased package', () => {
    expect(safeNpmSpecToPurl('node-types@npm:@types/node@20.0.0')).toBe(
      safeNpmSpecToPurl('@types/node@20.0.0'),
    )
    expect(
      safeNpmSpecToPurl('node-types@npm:@types/node@20.0.0'),
    ).not.toContain('node-types')
  })

  it('resolves an alias with a range the same as the direct range spec', () => {
    expect(safeNpmSpecToPurl('my-lodash@npm:lodash@^4')).toBe(
      safeNpmSpecToPurl('lodash@^4'),
    )
  })

  it('resolves an alias to a dist-tag', () => {
    expect(safeNpmSpecToPurl('my-react@npm:react@latest')).toBe(
      safeNpmSpecToPurl('react@latest'),
    )
    expect(safeNpmSpecToPurl('my-react@npm:react@latest')).not.toContain(
      'my-react',
    )
  })
})
