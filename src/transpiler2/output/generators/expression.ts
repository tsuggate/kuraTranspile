import {
   ArrayExpression,
   AssignmentExpression,
   BinaryExpression,
   CallExpression,
   ConditionalExpression,
   ExpressionStatement,
   FunctionExpression,
   LogicalExpression,
   MemberExpression,
   NewExpression,
   ObjectExpression,
   ThisExpression,
   UnaryExpression,
   UpdateExpression
} from 'estree';
import {generate} from '../generate';
import {operatorHasPrecedence} from './operators';
import {GenOptions} from '../generator-options';


export function binaryExpression(e: BinaryExpression, options: GenOptions): string {
   let left, right;

   if (e.left.type === 'BinaryExpression' && !operatorHasPrecedence(e.operator, e.left.operator)) {
      left = `(${generate(e.left, options)})`;
   }
   else {
      left = `${generate(e.left, options)}`;
   }

   if (e.right.type === 'BinaryExpression' && !operatorHasPrecedence(e.operator, e.right.operator)) {
      right = `(${generate(e.right, options)})`;
   }
   else {
      right = `${generate(e.right, options)}`;
   }

   return `${left} ${e.operator} ${right}`;
}

export function expressionStatement(e: ExpressionStatement, options: GenOptions): string {
   if (options.getLanguage() === 'typescript' && e['directive'] && e['directive'].includes('use strict')) {
      return '';
   }

   return `${generate(e.expression, options)};`;
}

export function callExpression(e: CallExpression, options: GenOptions): string {
   const args = e.arguments.map(a => generate(a, options)).join(', ');

   return `${generate(e.callee, options)}(${args})`;
}

export function newExpression(e: NewExpression, options: GenOptions): string {
   const args = e.arguments.map(a => generate(a, options)).join(', ');

   return `new ${generate(e.callee, options)}(${args})`;
}

export function arrayExpression(a: ArrayExpression, options: GenOptions): string {
   return '[' + a.elements.map(e => generate(e, options)).join(', ') + ']';
}

export function functionExpression(f: FunctionExpression, options: GenOptions): string {
   if (f.id !== null) {
      throw 'functionExpression.id !== null';
   }

   const params = f.params.map(p => generate(p, options)).join(', ');

   return `function(${params}) ${generate(f.body, options)}`;
}

export function functionExpressionTs(f: FunctionExpression, options: GenOptions): string {
   if (f.id !== null) {
      throw 'functionExpression.id !== null';
   }

   const params = f.params.map(p => generate(p, options) + ': any').join(', ');

   return `function(${params}) ${generate(f.body, options)}`;
}

export function memberExpression(e: MemberExpression, options: GenOptions): string {
   if (e.computed) {
      return `${generate(e.object, options)}[${generate(e.property, options)}]`;
   }
   return `${generate(e.object, options)}.${generate(e.property, options)}`
}

export function objectExpression(e: ObjectExpression, options: GenOptions): string {
   return '{' + e.properties.map(p => generate(p, options)).join(', ') + '}';
}

export function thisExpression(e: ThisExpression): string {
   return 'this';
}

export function assignmentExpression(e: AssignmentExpression, options: GenOptions): string {
   return `${generate(e.left, options)} ${e.operator} ${generate(e.right, options)}`;
}

export function logicalExpression(e: LogicalExpression, options: GenOptions): string {
   let left, right;

   if (e.operator === '&&') {
      left = e.left.type === 'LogicalExpression' ?
       `(${generate(e.left, options)})` : generate(e.left, options);

      right = e.right.type === 'LogicalExpression' ?
       `(${generate(e.right, options)})` : generate(e.right, options);
   }
   else {
      left = generate(e.left, options);

      right = generate(e.right, options);
   }

   return `${left} ${e.operator} ${right}`;
}

export function conditionalExpression(e: ConditionalExpression, options: GenOptions): string {
   return `${generate(e.test, options)} ? ${generate(e.consequent, options)} : ${generate(e.alternate, options)}`;
}

export function unaryExpression(e: UnaryExpression, options: GenOptions): string {
   if (e.prefix) {
      if (e.operator === '!' && e.argument.type === 'LogicalExpression') {
         return `${e.operator}(${generate(e.argument, options)})`;
      }

      return `${e.operator} ${generate(e.argument, options)}`
   }
   return `${generate(e.argument, options)}${e.operator}`;
}

export function updateExpression(e: UpdateExpression, options: GenOptions): string {
   if (e.prefix) {
      return `${e.operator}${generate(e.argument, options)}`;
   }
   else {
      return `${generate(e.argument, options)}${e.operator}`;
   }
}

