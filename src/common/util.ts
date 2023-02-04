import { Type } from '@nestjs/common';
import { DefinitionsFactory } from '@nestjs/mongoose';
import mongoose, { SchemaDefinition, SchemaDefinitionType } from 'mongoose';
import { AuthVendor } from '../auth/authVendor';

export function generateId(authVendor: AuthVendor, authId: string) {
  return `${authVendor}-${authId}`;
}

export function daysToSeconds(days: number) {
  return days * 24 * 60 * 60;
}

export function currentTimeInSeconds() {
  return Math.floor(new Date().getTime() / 1000);
}

export function getDayDiff(startDate: number, endDate: number) {
  return Math.round((endDate - startDate) / (3600 * 24));
}

export function createEmptyNestedArray(size: number) {
  const array = [];
  for (let i = 0; i < size; i++) {
    array.push([]);
  }
  return array;
}

export function generateSchemaWithoutId<TClass = any>(
  target: Type<TClass>,
): mongoose.Schema<TClass> {
  const schemaDefinition = DefinitionsFactory.createForClass(target);
  return new mongoose.Schema<TClass>(
    schemaDefinition as SchemaDefinition<SchemaDefinitionType<TClass>>,
    { _id: false },
  );
}

export function zip(a: any[], b: any[]): any[] {
  return a.map((k, i) => [k, b[i]]);
}

/*
현재 mongoose의 Model 객체로부터 얻는 document의 embedded document를 expect문에서 사용할 때 버그가 있음.
따라서 우회법으로 이 함수를 이용해 해당 document와 같은 값을 가지는 object를 생성하여 expect문에서 사용해야 함.
*/
export function toPlainObject(target: any, blueprint: any) {
  if (Array.isArray(target)) {
    if (!Array.isArray(blueprint) || target.length != blueprint.length) {
      throw new Error(
        `Target and blueprint have different values, which means equality expectation has already failed. \nTarget value: ${target} \nBlueprint value: ${blueprint}`,
      );
    } else if (target.length == 0) {
      return [];
    } else {
      return zip(target, blueprint).map(([subTarget, subBlueprint]) =>
        toPlainObject(subTarget, subBlueprint),
      );
    }
  } else if (typeof target == 'object') {
    const destination = {};
    for (const propertyName of Object.getOwnPropertyNames(blueprint)) {
      if (!target[propertyName]) {
        throw new Error(`Target has no property in blueprint: ${propertyName}`);
      }
      destination[propertyName] = toPlainObject(
        target[propertyName],
        blueprint[propertyName],
      );
    }
    return destination;
  } else {
    return target;
  }
}
