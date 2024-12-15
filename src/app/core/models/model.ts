export interface DataModel {
  vague:  string;
  genre: string;
  age: string;
  departement: string;
  solutionAboutClimat: string;
  modeTransport: string;
  sympathieMouvEcolo: string;
  typeHabitat: string;
  statut: string;
  diplome: string;
}

/*Il y a beacoup de données et j'ai décider de limiter mon etudes par vague 1 et 2
et a chaque fois je recupere deux genres differents avec les memees tranches d'ages
Je compare la vague 1 ceux qui ont : [ 25-34 ans - 35-49 ans ] contre la vague 2 avec les memes tranches d'ages
*/
