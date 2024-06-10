import { preserveWhitespacesDefault } from '@angular/compiler';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {BezierConnector, DotEndpoint, EVENT_CONNECTION_CLICK, EVENT_DRAG_START, EVENT_DRAG_STOP, EVENT_ELEMENT_CLICK, newInstance} from "@jsplumb/browser-ui"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'flow-chart';
  wasDragged = false;
  spacePressed = false;
  selectStyle = ["border-solid", "border-2", "border-black"]
  defaultStyle = ["border-dashed", "border-gray-600"]
  moveMap = {
    startx: 0,
    starty: 0,
    scrollX: 0,
    scrollY: 0,
    lastScrollX: 0,
    lastScrollY: 0
  }

  ngAfterViewInit(): void {
    const box1 = document.getElementById("box1")! as Element;
    const box2 = document.getElementById("box2")! as Element;
    const demobox = document.getElementById("demobox")
    const pg = document.getElementById("playground")! as Element;

    const container = document.getElementById("container")! as Element;

    const instance = newInstance({
      container: container
    })

    const endpointConfig = {
      maxConnections: -1,
      detachable: true,
      endpoint: DotEndpoint.type,
      options: {
        radius: 7
      },
      overlays: [
        {
          type: "Array",
          options: {
            location: 0.9
          }
        }
      ],
      source: true,
      target: true
    }
    const topAnchorOptions = {
      anchor: "Top",
      target: true,
    }
    const botAnchorOptions = {
      anchor: "Bottom",
      source: true,
    }
    const connectionTypes = {
      "default": {
        paintStyle: {
          stroke: "#f0f0f0",
          strokeWidth: 2
        },
        hoverPaintStyle: {
          stroke: "#ffde85",
          strokeWidth: 2
        },
        cssClass: "hover:shadow-sm",
        detachable: true,
        connector:{
          type:BezierConnector.type,
          options:{
              curviness: 50
          }
        }
      },
      "selected": {
        paintStyle: {
          stroke: "#fffd94",
          strokeWidth: 4
        },
        hoverPaintStyle: {
          stroke: "#fffd94",
          strokeWidth: 4
        },
        detachable: true,
        connector:{
          type:BezierConnector.type,
          options:{
              curviness: 50
          }
        }
      }
    }

    instance.registerConnectionTypes(connectionTypes)

    instance.bind( EVENT_DRAG_START, (e: any) => {
      e.el.classList.add("shaded_border")
    })
    instance.bind( EVENT_DRAG_STOP, (e: any) => {
      this.wasDragged = true
      e.el.classList.remove("shaded_border")
    })
    instance.bind( EVENT_ELEMENT_CLICK, (e: any) => {
      if(!this.wasDragged) {
        e.classList.add("active")
        e.classList.add("shaded_border")
      } else {
        this.wasDragged = false
      }
    } )
    instance.bind( EVENT_CONNECTION_CLICK, (e: any) => {
      e.toggleType("selected")
    } )
    container.addEventListener("click", function (event) {
      let target: HTMLElement | null = event.target! as HTMLElement;
  
      // Find the nearest ancestor with the attribute 'data-jtk-managed'
      while (target && !target.hasAttribute('data-jtk-managed')) {
        target = target.parentElement;
      }
  
      if (!target || !target.hasAttribute('data-jtk-managed')) {
        // Remove 'active' class from all elements
        console.log("clicked outside")
        const activeElements = container.querySelectorAll('[data-jtk-managed].active');
        activeElements.forEach(elm => {
          elm.classList.remove('active');
          elm.classList.remove('shaded_border')
        })
      }
    })

    // scrolling the container without scrollbar
    window.addEventListener("keydown", (e: any) => {
      if(e.code === 'Space' && !this.spacePressed) {
        e.preventDefault();
        (container! as HTMLElement).style.cursor = "grab";
        this.spacePressed = true;
      }
    })
    window.addEventListener("keyup", (e: any) => {
      if(e.code === 'Space') {
        e.preventDefault();
        this.spacePressed = false;
        (container! as HTMLElement).style.cursor = "default"
        this.wasDragged = false;
      }
    })
    container.addEventListener("mousedown", (e: any) => {
      if(this.spacePressed) {
        e.preventDefault();
        // e.srcElement.style.cursor = "grabbing";
        this.wasDragged = true;
        (container! as HTMLElement).style.cursor = "grabbing"
        this.moveMap.startx = e.clientX;
        this.moveMap.starty = e.clientY;
        this.moveMap.scrollX = this.moveMap.lastScrollX || 0;
        this.moveMap.scrollY = this.moveMap.lastScrollY || 0;
        console.log(this.moveMap)
      }
    })
    container.addEventListener("mousemove", (e: any) => {
      if(this.wasDragged && this.spacePressed){
        e.preventDefault();
        const dx = e.clientX - this.moveMap.startx;
        const dy = e.clientY - this.moveMap.starty;
        pg.scrollTo(this.moveMap.scrollX - dx, this.moveMap.scrollY - dy)
        console.log("scroll: ", this.moveMap.scrollX - dx, this.moveMap.scrollY - dy)
        this.moveMap.lastScrollX = this.moveMap.scrollX - dx;
        this.moveMap.lastScrollY = this.moveMap.scrollY - dy;
      }
      
    })
    container.addEventListener("mouseup", (e: any) => {
      // console.log("mouse up")
      if(this.spacePressed) {
        e.preventDefault();
        (container! as HTMLElement).style.cursor = "grab"
        this.wasDragged = false
      } else {
        e.preventDefault();
        (container! as HTMLElement).style.cursor = "default"
      }
    })

    // drag and drop for adding elements
    demobox?.setAttribute("draggable", "true")
    demobox?.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", "This is a drag and drop test!")
    })
    container.addEventListener('dragover', (e: any) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move"
    })
    container.addEventListener("drop", (e: any) => {
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      createPlumbInstance(x,y)
    })

    // setting up instances
    instance.addEndpoint(box1, {
      anchor: "Bottom",
      source: true,
      endpoint: DotEndpoint.type
    })

    instance.addEndpoint(box2, {
      anchor: "Top",
      target: true,
      endpoint: DotEndpoint.type
    })

    // creating a new element in 
    const createPlumbInstance = (x: number, y: number) => {
      const newDiv = document.createElement('div');
      newDiv.id = "box3"
      newDiv.setAttribute("data-jtk-managed", "box3")
      newDiv.className = `absolute w-32 h-24 bg-blue-200 border border-dashed border-gray-200 border-4 rounded-lg overflow-hidden`;
      newDiv.style.top = `${y - 12*4}px`
      newDiv.style.left = `${x - 16*4}px`
      container.appendChild(newDiv)
    }

  }

}
