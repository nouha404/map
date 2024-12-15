import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatabaseServiceImpl} from "../core/services/database.service.impl";
import {DataModel} from "../core/models/model";
import {CommonModule} from "@angular/common";
import {data} from "autoprefixer";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private dataService:DatabaseServiceImpl) { }
  @ViewChild('svgMap', { static: true }) svgMap!: ElementRef;
  response: DataModel[] | DataModel = [];
  departements: string[]=[];
  allData: DataModel[] = [];
  filterDepartement : string = ''
  isDetailVisible: boolean = false;

  ngOnInit(): void {
    this.loadDepartements();
    //console.log(this.showDetails(this.filterDepartement))
    //this.showDetails(this.filterDepartement)

    console.log(this.allData)



  }

  loadDepartements(): void {
    if (this.departements.length === 0){
      this.dataService.findAllDepartement().subscribe(
        (data) => {
          this.departements = data;
        },
        error => {
          console.error('Erreur de recuperation :', error);
        }
      );

    }

  }


  showDetails(departement: string) {
    this.dataService.findAll(departement).subscribe((data: DataModel[] | DataModel) => {
        this.filterDepartement = departement;
        this.response = data;
        console.log(data)
        this.isDetailVisible = true;

        if (Array.isArray(this.response)) {
          this.allData = this.response;
          //this.response.forEach(item => console.log('Item:', item));
        }

        const paths = this.svgMap.nativeElement.querySelectorAll('path.land');
        /*paths.forEach((path: SVGPathElement) => {
          console.log('Path title: ', path.getAttribute('title'));
        });*/

        paths.forEach((path: SVGPathElement) => {
          path.style.fill = '';
        });


        const targetPath = Array.from(paths).find((path: any) => path.getAttribute('title') === departement);
        if (targetPath && targetPath instanceof SVGPathElement) {
          targetPath.style.fill = '#000080';
          targetPath.style.transition = 'fill 0.2s';
        }else {
          console.log('No matching path found for:', departement);
        }

      },
      error => {
        console.error('Erreur de recuperation :', error);
      }
    );


  }

  clickOnMap(event: MouseEvent): void {
    const target = event.target as SVGPathElement;
    const departement = target.getAttribute('title');
    if (departement) {
      this.showDetails(departement);
    }
  }


}
