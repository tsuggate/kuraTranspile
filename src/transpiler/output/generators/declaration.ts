import {
  ArrayPattern,
  Declaration,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  ImportDeclaration,
  ImportDefaultSpecifier,
  Node,
  ObjectPattern,
  VariableDeclaration,
  VariableDeclarator,
} from 'estree';
import {generate} from '../generate';
import {GenOptions} from '../generator-options';
import {containsThisUsage, getFunctionDeclarationTypes} from './find-types/function-declaration';
import {findAssignmentTo} from './find-types/declaration-kind';
import {CodeRange} from './find-types/shared';
import {generateImportFromRequireStatement, isRecognisedRequireStatement} from '../../mods/imports';

export function variableDeclarationToJs(dec: VariableDeclaration, options: GenOptions): string {
  const declarations = dec.declarations.map((d) => generate(d, options)).join(', ');

  return `${dec.kind} ${declarations};`;
}

export function variableDeclarationToTs(dec: VariableDeclaration, options: GenOptions): string {
  if (isRecognisedRequireStatement(dec)) {
    return generateImportFromRequireStatement(dec, options);
  }

  const declarations = dec.declarations.map((d) => generate(d, options)).join(', ');
  let kind = 'const';

  const parent = options.findParentNode(dec);

  if (parent) {
    dec.declarations.forEach((d) => {
      if (d.id.type === 'Identifier') {
        const res = findAssignmentTo(options.getProgram(), d.id, parent.range as CodeRange);
        if (res) {
          kind = 'let';
        }
      }
    });
  }

  return `${kind} ${declarations};`;
}

export function variableDeclarator(dec: VariableDeclarator, options: GenOptions): string {
  const name = generate(dec.id, options);

  if (dec.init) {
    if (options.shouldInsertAny()) {
      if (dec.init.type === 'ArrayExpression' && dec.init.elements.length === 0) {
        return `${name}: any[] = []`;
      } else if (dec.init.type === 'ObjectExpression' && dec.init.properties.length === 0) {
        return `${name}: Record<string, any> = {}`;
      } else if (dec.init.type === 'Literal' && dec.init.raw === 'null') {
        return `${name}: any = null`;
      } else if (dec.init.type === 'Identifier' && dec.init.name === 'undefined') {
        return `${name}: any = undefined`;
      }
    }

    return `${name} = ${generate(dec.init, options)}`;
  }

  if (options.shouldInsertAny()) {
    const grandParent = options.findGranParentNode(dec);

    if (grandParent && grandParent.type === 'ForInStatement') {
      return `${name}`;
    }

    return `${name}: any`;
  }
  return `${name}`;
}

export function getVariableDeclarationNames(
  dec: VariableDeclaration,
  options: GenOptions
): string[] {
  return dec.declarations.map((d) => generate(d.id, options));
}

export function functionDeclaration(f: FunctionDeclaration, options: GenOptions): string {
  if (f.generator) {
    throw 'functionDeclaration.generator not implemented!';
  }
  const params = f.params.map((p) => generate(p, options)).join(', ');

  return `function ${generate(f.id!, options)}(${params}) ${generate(f.body, options)}`;
}

export function functionDeclarationTs(f: FunctionDeclaration, options: GenOptions): string {
  if (f.generator) {
    throw 'functionDeclaration.generator not implemented!';
  }

  const types = getFunctionDeclarationTypes(f, options) || [];

  // if (!types || (f.params.length !== types.length && types.length !== 0)) {
  //    throw new Error(`functionDeclaration types don't match for ${generate(f.id, options)}`);
  // }

  // const paramsArray = f.params.map((p, i) => {
  //   if (p.type === 'AssignmentPattern') {
  //     return generate(p, options);
  //   }
  //
  //   const t = types[i] || 'any';
  //   return generate(p, options) + `: ${t}`;
  // });
  //
  // if (containsThisUsage(f.body)) {
  //   paramsArray.unshift('this: any');
  // }
  //
  // const params = paramsArray.join(', ');

  const params = genFunctionParams(f, options, types);
  const name = generate(f.id!, options);
  const body = generate(f.body, options);

  return `function ${name}(${params}) ${body}`;
}

export function genFunctionParams(
  f: FunctionDeclaration | FunctionExpression,
  options: GenOptions,
  types: string[] = []
): string {
  const paramsArray = f.params.map((p, i) => {
    if (p.type === 'AssignmentPattern') {
      return generate(p, options);
    }

    const t = types[i] || 'any';
    return generate(p, options) + `: ${t}`;
  });

  if (containsThisUsage(f.body)) {
    paramsArray.unshift('this: any');
  }

  return paramsArray.join(', ');
}

export function objectPattern(o: ObjectPattern, options: GenOptions): string {
  const properties = o.properties.map((p) => generate(p, options)).join(', ');

  return `{${properties}}`;
}

export function arrayPattern(o: ArrayPattern, options: GenOptions): string {
  const properties = o.elements.map((p) => generate(p, options)).join(', ');

  return `[${properties}]`;
}

export function getFunctionDeclarationName(f: FunctionDeclaration, options: GenOptions): string {
  return generate(f.id!, options);
}

export function getNamesFromDeclaration(d: Declaration, options: GenOptions): string[] {
  switch (d.type) {
    case 'FunctionDeclaration':
      return [getFunctionDeclarationName(d, options)];
    case 'VariableDeclaration':
      return getVariableDeclarationNames(d, options);
    case 'ClassDeclaration':
      throw new Error('getNamesFromDeclaration for ClassDeclaration not implemented.');
  }
}

export function isDeclaration(node: Node): boolean {
  return node.type.includes('Declaration');
}

export function importDeclaration(d: ImportDeclaration, options: GenOptions): string {
  const specifiers = d.specifiers.map((s) => generate(s, options)).join(', ');

  if (specifiers) {
    return `import ${specifiers} from ${generate(d.source, options)};\n`;
  }
  return `import ${generate(d.source, options)};\n`;
}

export function importDefaultSpecifier(i: ImportDefaultSpecifier, options: GenOptions): string {
  return `${generate(i.local, options)}`;
}

export function exportDefaultDeclaration(e: ExportDefaultDeclaration, options: GenOptions): string {
  return `export default ${generate(e.declaration, options)}`;
}
