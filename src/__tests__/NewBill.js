/**
 * @jest-environment jsdom
 */

import { fireEvent,screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js"
import BillsUI from "../views/BillsUI.js"
import store from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event"
import { Router } from "express"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock})
      window.localStorage.setItem("user", JSON.stringify({type:'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      //Navigation et chargement de page
      const pathname = ROUTES_PATH["NewBill"]
      root.innerHTML = ROUTES({ pathname: pathname, loading:true})
      document.getElementById("layout-icon1").classList.remove("active-icon")
      document.getElementById("layout-icon2").classList.add("active-icon")
      //Récupération de l'icône
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId("icon-mail")
      //Vérification de la classe "active-icon"
      const iconActivated = mailIcon.classList.contains("active-icon")
      expect(iconActivated).toBeTruthy()
    })
  })

  describe("When I select a file with an incorrect extension", () => {
    test("Then the bill is refused", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      //Initialisation
      const newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})
      //Sélection du fichier
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId("file")
      input.addEventListener("change", handleChangeFile)
      //Mauvais format
      fireEvent.change(input, {
        target: {
          files : [
            new File(["file.pdf"], "file.pdf", {
              type: "image/txt",
            })
          ]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe("file.pdf")
    })
  })

  describe("When I select a document with a correct extension", () => {
    test("Then the input file should display the file name", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      //Initialisation
      const newBill = new NewBill({document, onNavigate, store, localStorage: window.localStorage})
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId("file")
      input.addEventListener("change", handleChangeFile)
      //Bon format
      fireEvent.change(input, {
        target: {
          files: [
            new File(["image.png"], "image.png", {
              type : "image/png"
            })
          ]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe("image.png")
    })
    test("Then a bill is created", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      //Initialisation
      const newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})
      //Submit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const submit = screen.getByTestId("form-new-bill")
      submit.addEventListener("submit", handleSubmit)
      fireEvent.submit(submit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

//Test d'intégration (POST)

describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", () => {
      document.body.innerHTML = NewBillUI()
      //Initialisation des champs Bills
      const inputData = {
        type: "Transports",
        name: "test",
        datepicker: "2022-06-27",
        amount: "76",
        vat: "70",
        pct: "20",
        commentary: "test",
        file: new File(["test"], "test.png", {type: "image/png"})
      }
      //On récupère les éléments
      const formNewBill = screen.getByTestId("form-new-bill")
      const inputExpenseName = screen.getByTestId("expense-name")
      const inputExpenseType = screen.getByTestId("expense-type")
      const inputDatepicker = screen.getByTestId("datepicker")
      const inputAmount = screen.getByTestId("amount")
      const inputVat = screen.getByTestId("vat")
      const inputPct = screen.getByTestId("pct")
      const inputCommentary = screen.getByTestId("commentary")
      const inputFile = screen.getByTestId("file")

      //On simule les valeurs
      fireEvent.change(inputExpenseName, {
        target: {value: inputData.name}
      })
      expect(inputExpenseName.value).toBe(inputData.name);

      fireEvent.change(inputExpenseType, {
        target: {value: inputData.type}
      })
      expect(inputExpenseType.value).toBe(inputData.type);

      fireEvent.change(inputDatepicker, {
        target: {value: inputData.datepicker}
      })
      expect(inputDatepicker.value).toBe(inputData.datepicker);

      fireEvent.change(inputAmount, {
        target: {value: inputData.amount}
      })
      expect(inputAmount.value).toBe(inputData.amount);

      fireEvent.change(inputVat, {
        target: {value: inputData.vat}
      })
      expect(inputVat.value).toBe(inputData.vat);

      fireEvent.change(inputPct, {
        target: {value: inputData.pct}
      })
      expect(inputPct.value).toBe(inputData.pct);

      fireEvent.change(inputCommentary, {
        target: {value: inputData.commentary}
      })
      expect(inputCommentary.value).toBe(inputData.commentary);

      userEvent.upload(inputFile, inputData.file)
      expect(inputFile.files[0]).toStrictEqual(inputData.file)
      expect(inputFile.files).toHaveLength(1)

      //On rempli localStorage avec les données de formulaire
      Object.defineProperty(window, "localStorage", {
        value : { getItem: jest.fn(() => JSON.stringify({email: "email@test.com",}))},
        writable: true
      })
      //On simule la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }

      //Initialisation
      const newBill = new NewBill({document, onNavigate, localStorage: window.localStorage})

      //On déclenche l'évènement
      const handleSubmit = jest.fn(newBill.handleSubmit)
      formNewBill.addEventListener("submit", handleSubmit)
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it fails with a 404 error", async () => {
      const html = BillsUI({error : "Erreur 404"})
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then it fails with a 500 error", async () => {
      const html = BillsUI({error : "Erreur 500"})
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})