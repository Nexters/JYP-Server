import { Type } from '@nestjs/common';
import { DefinitionsFactory } from '@nestjs/mongoose';
import mongoose, { SchemaDefinition, SchemaDefinitionType } from 'mongoose';
import { AuthVendor } from '../auth/authVendor';

export function generateId(authVendor: AuthVendor, authId: string) {
  return `${authVendor}-${authId}`;
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
