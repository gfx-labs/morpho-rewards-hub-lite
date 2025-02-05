import { UrdCreated as UrdCreatedEvent } from "../../generated/URDFactory/URDFactory";
import { Urd } from "../../generated/schema";
import { URD } from "../../generated/templates";

export function handleUrdCreated(event: UrdCreatedEvent): void {
  URD.create(event.params.urd);

  let urd = new Urd(event.params.urd);
  urd.creator = event.params.caller;
  urd.owner = event.params.initialOwner;
  urd.save();
}
