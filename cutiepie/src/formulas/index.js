import add from './addFormula';
import subtract from './subtractFormula';
import multiply from './multiplyFormula';
import divide from './divideFormula';
import runningTotal from './runningTotalFormula';
import movingAverage3 from './movingAverage3Formula';
import percentChange from './percentChangeFormula';
import percentOfTotal from './percentOfTotalFormula';
import differenceFromAverage from './differenceFromAverageFormula';
import min from './minFormula';
import max from './maxFormula';

export const formulas = [
  add,
  differenceFromAverage,
  divide,
  max,
  min,
  movingAverage3,
  multiply,
  percentChange,
  percentOfTotal,
  runningTotal,
  subtract
].sort((a, b) => a.name.localeCompare(b.name));

export const formulaMap = new Map(formulas.map((formula) => [formula.id, formula]));
