import {Node} from 'estree';
import * as escodegen from 'escodegen';
import {
  assignmentPattern,
  identifierToJs,
  literalToJs,
  programToJs,
  propertyToJs,
  spreadElement,
  templateLiteral,
} from './generators/misc';
import {
  arrayExpression,
  arrowFunctionExpression,
  arrowFunctionExpressionTs,
  assignmentExpression,
  binaryExpression,
  callExpression,
  conditionalExpression,
  expressionStatement,
  functionExpression,
  functionExpressionTs,
  logicalExpression,
  memberExpression,
  newExpression,
  objectExpression,
  sequenceExpression,
  thisExpression,
  unaryExpression,
  updateExpression,
} from './generators/expression';
import {
  blockStatement,
  breakStatement,
  catchClause,
  continueStatement,
  doWhileStatement,
  emptyStatement,
  forInStatement,
  forStatement,
  ifStatement,
  returnStatement,
  switchCase,
  switchStatement,
  throwStatement,
  tryStatement,
  whileStatement,
} from './generators/statement';
import {
  arrayPattern,
  exportDefaultDeclaration,
  functionDeclaration,
  functionDeclarationTs,
  importDeclaration,
  importDefaultSpecifier,
  objectPattern,
  variableDeclarationToJs,
  variableDeclarationToTs,
  variableDeclarator,
} from './generators/declaration';
import {generateImports, isDefine} from '../mods/imports';
import {insertComments} from './generators/comments';
import {GenOptions} from './generator-options';

export function generate(node: Node, options: GenOptions): string {
  let result;

  if (options.getLanguage() === 'javascript') {
    result = getGenerateFunctionJs(node)(node, options);
  } else {
    const func = getGenerateFunctionTs(node);

    if (func) {
      result = func(node, options);
    } else {
      result = getGenerateFunctionJs(node)(node, options);
    }
  }

  return insertComments(result, node, options);
}

function getGenerateFunctionTs(node: Node): null | ((node: Node, options: GenOptions) => string) {
  switch (node.type) {
    case 'ExpressionStatement':
      if (isDefine(node)) {
        return generateImports;
      }
      return expressionStatement;

    case 'FunctionDeclaration':
      return functionDeclarationTs;
    case 'VariableDeclaration':
      return variableDeclarationToTs;

    case 'FunctionExpression':
      return functionExpressionTs;
    case 'ArrowFunctionExpression':
      return arrowFunctionExpressionTs;
    default:
      return null;
  }
}

function getGenerateFunctionJs(node: Node): (node: Node, options: GenOptions) => string {
  switch (node.type) {
    case 'Program':
      return programToJs;
    case 'Property':
      return propertyToJs;
    case 'Identifier':
      return identifierToJs;
    case 'Literal':
      return literalToJs;
    case 'ObjectPattern':
      return objectPattern;
    case 'ArrayPattern':
      return arrayPattern;

    case 'TemplateLiteral':
      return templateLiteral;
    case 'AssignmentPattern':
      return assignmentPattern;
    case 'SpreadElement':
      return spreadElement;

    case 'VariableDeclaration':
      return variableDeclarationToJs;
    case 'VariableDeclarator':
      return variableDeclarator;
    case 'FunctionDeclaration':
      return functionDeclaration;
    case 'ImportDeclaration':
      return importDeclaration;
    case 'ImportDefaultSpecifier':
      return importDefaultSpecifier;
    case 'ExportDefaultDeclaration':
      return exportDefaultDeclaration;

    case 'BinaryExpression':
      return binaryExpression;
    case 'CallExpression':
      return callExpression;
    case 'NewExpression':
      return newExpression;
    case 'ArrayExpression':
      return arrayExpression;
    case 'FunctionExpression':
      return functionExpression;
    case 'MemberExpression':
      return memberExpression;
    case 'ObjectExpression':
      return objectExpression;
    case 'ThisExpression':
      return thisExpression;
    case 'AssignmentExpression':
      return assignmentExpression;
    case 'LogicalExpression':
      return logicalExpression;
    case 'ConditionalExpression':
      return conditionalExpression;
    case 'UnaryExpression':
      return unaryExpression;
    case 'UpdateExpression':
      return updateExpression;
    case 'ArrowFunctionExpression':
      return arrowFunctionExpression;
    case 'SequenceExpression':
      return sequenceExpression;

    case 'BlockStatement':
      return blockStatement;
    case 'ReturnStatement':
      return returnStatement;
    case 'ExpressionStatement':
      return expressionStatement;
    case 'IfStatement':
      return ifStatement;
    case 'ForStatement':
      return forStatement;
    case 'SwitchStatement':
      return switchStatement;
    case 'SwitchCase':
      return switchCase;
    case 'BreakStatement':
      return breakStatement;
    case 'ContinueStatement':
      return continueStatement;
    case 'ForInStatement':
      return forInStatement;
    case 'ThrowStatement':
      return throwStatement;
    case 'TryStatement':
      return tryStatement;
    case 'CatchClause':
      return catchClause;
    case 'WhileStatement':
      return whileStatement;
    case 'DoWhileStatement':
      return doWhileStatement;
    case 'EmptyStatement':
      return emptyStatement;

    default:
      console.log(node);
      console.log(escodegen.generate(node));
      throw new Error(node.type + ' not implemented!');
  }
}
