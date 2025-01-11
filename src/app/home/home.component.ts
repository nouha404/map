import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatabaseServiceImpl} from "../core/services/database.service.impl";
import {DataModel} from "../core/models/model";
import {CommonModule} from "@angular/common";
import  * as d3 from "d3";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private dataService:DatabaseServiceImpl) { }
  @ViewChild('svgChart', { static: true }) svgChart!: ElementRef;
  @ViewChild('svgCirculaire', { static: true }) svgCirculaire!: ElementRef;
  @ViewChild('svgBar', { static: true }) svgBar!: ElementRef;
  @ViewChild('svgMap', { static: true }) svgMap!: ElementRef;

  response: DataModel[] | DataModel = [];
  departements: string[]=[];
  allData: DataModel[] = [];
  filterDepartement : string = ''
  isDetailVisible: boolean = false;
  hoveredDepartement: string = '';

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
        this.createBarChart();
        this.createCirculaireChart();
        this.createBarTwoChart(this.filterDepartement)

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

  createBarChart(): void {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    if (!this.allData || this.allData.length === 0) {
      console.error("Aucune donnée disponible pour générer le diagramme.");
      return;
    }

    // Filtrer les données selon le département sélectionné
    const filteredData = this.allData.filter(item => item.departement === this.filterDepartement);

    if (filteredData.length === 0) {
      console.error(`Aucune donnée trouvée pour le département: ${this.filterDepartement}`);
      return;
    }

    const data2 = d3.rollups(
      filteredData,
      v => v.length,
      d => d.genre
    ).map(([label, value]) => ({ label, value }));

    // Supprimer les anciens éléments SVG
    d3.select(this.svgChart.nativeElement).selectAll("*").remove();

    const svg = d3.select(this.svgChart.nativeElement)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data2.map(d => d.label))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data2, d => +d.value)!])
      .nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .attr("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    // Ajouter les barres avec des couleurs
    svg.selectAll(".bar")
      .data(data2)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label)!)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))

    // Ajouter les valeurs sur les barres
    svg.selectAll(".label")
      .data(data2)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.label)! + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.value)
      .style("fill", "#FFF")
      .style("font-size", "12px");
  }
  createCirculaireChart(): void {
    const margin = { top: 20, right: 240, bottom: 40, left: 75 };
    //const margin = { top: 20, right: 150, bottom: 40, left: 70 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    if (!this.allData || this.allData.length === 0) {
      console.error("Aucune donnée disponible pour générer le diagramme circulaire.");
      return;
    }

    // Filtrer les données selon le département sélectionné
    const filteredData = this.allData.filter(item => item.departement === this.filterDepartement);

    if (filteredData.length === 0) {
      console.error(`Aucune donnée trouvée pour le département: ${this.filterDepartement}`);
      return;
    }

    // Regrouper les données filtrées par `age` et `modeTransport`
    const data2 = d3.rollups(
      filteredData,
      v => v.length,  // Compter le nombre d'occurrences dans chaque groupe
      d => d.age,      // Grouper par âge
      d => d.modeTransport // Grouper par mode de transport
    ).map(([age, modes]) => ({
      age,
      modes: modes.map(([mode, count]) => ({ mode, count }))
    }));

    console.log("Données transformées pour le graphique circulaire :", data2);

    // Supprimer les anciens éléments SVG
    d3.select(this.svgCirculaire.nativeElement).selectAll("*").remove();

    const svg = d3.select(this.svgCirculaire.nativeElement)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleOrdinal()
      .domain(["Voiture", "Transports publics", "Train", "Vélo / À pied", "Non précisé", "Deux-roues motorisé"])
      .range(d3.schemeTableau10);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data2, d => d3.max(d.modes, m => m.count))!])
      .nice()
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data2.map(d => d.age))
      .range([0, height])
      .padding(0.1);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(data2.flatMap(d => d.modes.map(m => ({ ...m, age: d.age }))))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.age)!)
      .attr("width", d => x(d.count))
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.mode) as string);

    svg.selectAll(".label")
      .data(data2.flatMap(d => d.modes.map(m => ({ ...m, age: d.age }))))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.count) - 5)
      .attr("y", d => y(d.age)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text(d => d.count)
      .style("fill", "#FFF")
      .style("font-size", "10px");

    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll(".legend")
      .data(colorScale.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d) => colorScale(d) as string);  // Casting to string

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(d => d);
  }

  createBarTwoChart(departement: string): void {
    const margin = { top: 20, right: 150, bottom: 40, left: 70 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Filtrer les données pour le département concerné
    const filteredData = this.allData.filter(d => d.departement === departement);

    if (!filteredData || filteredData.length === 0) {
      console.error("Aucune donnée disponible pour ce département.");
      return;
    }

    // Préparer les données agrégées
    const data = d3.rollups(
      filteredData,
      v => v.length,
      d => d.diplome,
      d => d.typeHabitat
    ).map(([diplome, habitats]) => ({
      diplome,
      habitats: habitats.map(([habitat, count]) => ({ habitat, count }))
    }));

    console.log("Données transformées pour le diagramme en barres :", data);

    // Nettoyer l'ancien graphique
    d3.select(this.svgBar.nativeElement).selectAll("*").remove();

    // Création de l'élément SVG
    const svg = d3.select(this.svgBar.nativeElement)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Échelle X
    const x = d3.scaleBand()
      .domain(data.flatMap(d => d.habitats.map(h => `${d.diplome}-${h.habitat}`)))
      .range([0, width])
      .padding(0.1);

    // Échelle Y
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.habitats, h => h.count))!])
      .nice()
      .range([height, 0]);

    // Échelle de couleurs
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Axe X
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d.split("-")[1]))
      .selectAll("text")
      .style("font-size", "10px")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "-0.15em")
      .attr("transform", "rotate(-45)");

    // Axe Y
    svg.append("g").call(d3.axisLeft(y));

    // Dessiner les barres
    svg.selectAll(".bar")
      .data(data.flatMap(d => d.habitats.map(h => ({ ...h, diplome: d.diplome }))))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(`${d.diplome}-${d.habitat}`)!)
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .style("fill", d => colorScale(d.habitat) as string);

    // Ajouter des étiquettes sur les barres
    svg.selectAll(".label")
      .data(data.flatMap(d => d.habitats.map(h => ({ ...h, diplome: d.diplome }))))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(`${d.diplome}-${d.habitat}`)! + x.bandwidth() / 2)
      .attr("y", d => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.count)
      .style("font-size", "10px")
      .style("fill", "#333");

    // Légende
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll(".legend")
      .data(colorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => colorScale(d) as string);

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(d => d);
  }

  //
  hoverDepartment(event: MouseEvent): void {
    const target = event.target as SVGPathElement;
    const departementName = target.getAttribute('title');
    const tooltip = document.getElementById('tooltip');

    if (departementName && tooltip) {
      this.hoveredDepartement = departementName;
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.classList.remove('hidden');
    }
  }
  clearHover(): void {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.classList.add('hidden');
    }
    this.hoveredDepartement = '';
  }






}
