import React from "react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";


it("renders without crashing", () => {
  <MemoryRouter>
    render(
    <NotFound />
    );
  </MemoryRouter>;
});
