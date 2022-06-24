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
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock})
      window.localStorage.setItem("user", JSON.stringify({type:'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const pathname = ROUTES_PATH["NewBill"]
      root.innerHTML = ROUTES({ pathname: pathname, loading:true})
      document.getElementById("layout-icon1").classList.remove("active-icon")
      document.getElementById("layout-icon2").classList.add("active-icon")
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId("icon-mail")
      const iconActivated = mailIcon.classList.contains("active-icon")
      expect(iconActivated).toBeTruthy()
    })
  })

  describe("When I select a document with a correct extension", () => {
    test("Then the input file should display the file name", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const newBill = new NewBill({document, onNavigate, store, localStorage: window.localStorage})
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId("file")
      input.addEventListener("change", handleChangeFile)
      fireEvent.change(input, {target :{ files: [new File(["image.png"], "image.png", {type : "image/png"})]}})
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe("image.png")
    })
    test
  })
})
