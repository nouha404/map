import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Papa} from "ngx-papaparse";
import {DataModel} from "../models/model";

@Injectable({
  providedIn: 'root',
})

export class DatabaseServiceImpl {
  constructor(private http: HttpClient,private parseCsv: Papa) {
  }
  private readonly data = '/assets/data/data.csv';


  findAll(departement?: string) {


    return this.http.get(this.data, { responseType: 'text' }).pipe(
      map((csvData: string) => {
        // parser les données CSV
        const datas: DataModel[] = this.parseCsv.parse(csvData, { header: true, skipEmptyLines: true }).data.map((row: any) => ({
          vague: row["Vague"], //vague: row["Vague"],
          genre: row["S1. genre"], //genre: row["S1. genre"],
          age: row["S2. âge"], //age: row["S2. âge"],
          departement: row["Département"],
          solutionAboutClimat: row["q11. Solutions changement climatique"],
          modeTransport: row["s22. Mode de transport"],
          sympathieMouvEcolo: row["s25. Sympathie mouvements écologistes"],
          typeHabitat: row["s17. Type habitat"],
          statut: row["s18. Statut locataire/propriétaire"],
          diplome: row["s15. Diplôme"]
        }));

        const filteredData = departement ? datas.filter((data) => {
            return data.departement // ?.trim() === departement.trim();
          })
          : datas;
        console.log(filteredData)
        return filteredData
      })
    );
  }

  findAllDepartement(): Observable<string[]> {
    return this.http.get(this.data, { responseType: 'text' }).pipe(
      map((csvData: string) => {
        const departements = this.parseCsv
          .parse(csvData, { header: true, skipEmptyLines: true })
          .data.map((row: any) => row["Département"]);

        return [...new Set(departements)] as string[];
      })
    );

  }

}
