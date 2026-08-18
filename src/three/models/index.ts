import type { ModelBuilder } from "../util";
import { buildProkaryote, buildCyanobacteria, buildEukaryote } from "./micro";
import { buildDickinsonia, buildChordate, buildJawedFish, buildTiktaalik } from "./aquatic";
import { buildHylonomus, buildMorganucodon, buildArchicebus } from "./land";
import { buildHominin, homininPresets } from "./hominin";

export const modelBuilders: Record<string, ModelBuilder> = {
  prokaryote: buildProkaryote,
  cyanobacteria: buildCyanobacteria,
  eukaryote: buildEukaryote,
  ediacaran: buildDickinsonia,
  chordate: buildChordate,
  jawed: buildJawedFish,
  tetrapod: buildTiktaalik,
  amniote: buildHylonomus,
  mammal: buildMorganucodon,
  primate: buildArchicebus,
  ardipithecus: () => buildHominin(homininPresets.ardipithecus),
  australopithecus: () => buildHominin(homininPresets.australopithecus),
  habilis: () => buildHominin(homininPresets.habilis),
  erectus: () => buildHominin(homininPresets.erectus),
  sapiens: () => buildHominin(homininPresets.sapiens),
};
