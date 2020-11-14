import { FiltersExpressions } from '../@types/index';

const buildFilters = ({ filters, joinCondition = 'AND' }): FiltersExpressions => {
  const filterExpresionArray: string[] = [];
  const filterExpressionAttrValues = {};
  const filterExpressionAttrNames = {};

  filters.forEach((filter) => {
    if (filter.attrValue) {
      switch (filter.operator) {
        case 'BETWEEN': {
          filterExpressionAttrNames[`#${filter.attrName}`] = `${filter.attrName}`;
          filterExpressionAttrValues[`:${filter.attrName}1`] = filter.attrValue;
          filterExpressionAttrValues[`:${filter.attrName}2`] = filter.attrValue2;
          filterExpresionArray.push(
            `#${filter.attrName} ${filter.operator} :${filter.attrName}1 AND :${filter.attrName}2`,
          );
          break;
        }
        case 'AND':
        default: {
          filterExpressionAttrNames[`#${filter.attrName}`] = filter.attrName;
          filterExpressionAttrValues[`:${filter.attrName}`] = filter.attrValue;
          filterExpresionArray.push(`#${filter.attrName} ${filter.operator} :${filter.attrName}`);
          break;
        }
      }
    }
  });

  return {
    filterExpresion: filterExpresionArray.join(` ${joinCondition} `),
    filterExpressionAttrValues,
    filterExpressionAttrNames,
  };
};

export default { buildFilters };
