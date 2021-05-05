import { HostEventt, Visibility } from "./Events";

interface HostEventSettingsProps {
  event: HostEventt;
}

function HostEventSettings(props: HostEventSettingsProps) {
  console.log("HostEventSettings props: " + JSON.stringify(props));

  const { id, guestToken, hostToken, name, description, emailAddressRequired, phoneNumberRequired, plus1Allowed, visibility } = props.event;

  return (
    <form>
      <div>
        <label htmlFor="nameText" className="form-label">Name</label>
        <input type="text" className="form-control" id="nameText" placeholder="Event Name" value={name} />
      </div>
      <div>
        <label htmlFor="descriptionText" className="form-label">Description</label>
        <textarea className="form-control" id="descriptionText" rows={3} value={description}></textarea>
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="emailAddressRequiredCheckbox" checked={emailAddressRequired} />
        <label className="form-check-label" htmlFor="emailAddressRequiredCheckbox">E-mail address required</label>
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="phoneNumberRequiredCheckbox" checked={phoneNumberRequired} />
        <label className="form-check-label" htmlFor="phoneNumberRequiredCheckbox">Phone number required</label>
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="plus1AllowedCheckbox" checked={plus1Allowed} />
        <label className="form-check-label" htmlFor="plus1AllowedCheckbox">+1 allowed</label>
      </div>
      <div className="input-group">
        <select className="form-select" id="visibilitySelect" value={visibility}>
          <option value={Visibility.PUBLIC}>Read/Write</option>
          <option value={Visibility.PROTECTED}>Read-only</option>
          <option value={Visibility.PRIVATE}>???</option>
        </select>
        <span className="input-group-text">Visibility</span>
      </div>
    </form>
  );
}

export default HostEventSettings;
