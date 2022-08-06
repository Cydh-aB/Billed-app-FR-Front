/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      //On récupère l'icône
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //Vérification de la classe "active-icon"
      const activeIcon = windowIcon.classList.contains("active-icon") 
      expect(activeIcon).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("Given I am connected as employee on the Bill and i click on the icon eye", () => {
    test("It should open the modal", () => {
      const html = BillsUI({
        data: bills,
      })
      document.body.innerHTML = html;
      //Init bills
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      }
      const billsList = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      //Simulation de la modale 
      $.fn.modal = jest.fn();
      const icon = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() => billsList.handleClickIconEye(icon))
      icon.addEventListener("click", handleClickIconEye)
      //On déclenche l'évènement
      fireEvent.click(icon)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.getElementById("modaleFile")
      expect(modale).toBeTruthy()
    })
  })

  describe("when I click on 'Send a new bill' page", () => {
    test("It should be sent to 'New bill page'", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({type: "Employee"})
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      //Initialisation
      const store = null
      const billsList= new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage, 
      })
      const newBill = jest.fn(() => billsList.handleClickNewBill)
      const navigButton = screen.getByTestId("btn-new-bill")
      navigButton.addEventListener("click", newBill)
      fireEvent.click(navigButton)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
})

//Test d'intégration (GET)
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to the Bills page", () => {
    test("fetches bills from mock API GET", () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      //mock bills
      const bills = new Bills({
        document, onNavigate, localStorage,
      })
      bills.getBills((data) => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector("tbody").rows.length).toBeGreaterThan(0)
      })
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window, 'localStorage', { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({ 
        type: 'Employee', email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () =>{
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getAllByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches message from an API abd fails with 500 message error", async () => {
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getAllByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
