import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Slider } from "@nextui-org/slider";
import { Snippet } from "@nextui-org/snippet";

import ButtonCreateCampaign from "@/components/ButtonCreateCampaign";

import { title } from "@/components/primitives";
import { useCampaign } from "@/components/contexts/campaign/CampaignContext";

export default function CreatorDashboard() {
  const [campaignUTxO] = useCampaign();
  if (!campaignUTxO) return <ButtonCreateCampaign />;

  const { CampaignInfo, StateToken } = campaignUTxO;
  return (
    <Badge
      variant="shadow"
      className="!-top-1.5 !-right-3 animate-bounce"
      showOutline={false}
      content={<span className="font-bold text-xs px-2 py-1">{CampaignInfo.data.state}</span>}
      color={
        CampaignInfo.data.state === "Running"
          ? "primary"
          : CampaignInfo.data.state === "Finished"
            ? "success"
            : CampaignInfo.data.state === "Cancelled"
              ? "danger"
              : "default"
      }
    >
      <Card>
        <CardHeader className="flex gap-3 w-full">
          <div className="flex flex-col gap-1 w-full">
            <p className={title({ size: "sm" })}>{CampaignInfo.data.name}</p>
            <p className="text-medium text-default-500">
              {`Deadline: ${CampaignInfo.data.deadline.toDateString()} ${CampaignInfo.data.deadline.toLocaleTimeString()}`}
            </p>
            <Slider
              label="Goal"
              showTooltip={true}
              tooltipProps={{
                content: Intl.NumberFormat(navigator.languages, { style: "currency", currency: "ADA" }).format(0), // TODO: currValue (sum_support)
                placement: "bottom",
                offset: 1.5,
              }}
              formatOptions={{ style: "currency", currency: "ADA" }}
              value={CampaignInfo.data.goal} // goal
              maxValue={Number.POSITIVE_INFINITY} // TODO: goal / currValue
              minValue={0}
              renderThumb={(props) => (
                // <div {...props} className="p-1 top-1/2 bg-primary rounded-full">
                //   <span className="transition-transform bg-background rounded-full size-3 block" />
                // </div>
                <div {...props} className="top-1/2">
                  <label className="text-3xl drop-shadow">🔥</label>
                </div>
              )}
              className="mt-4 mb-2"
            />
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <label htmlFor="campaign-id" className="text-sm mt-2">
            Campaign ID:
          </label>
          <Snippet id="campaign-id" hideSymbol variant="bordered" className="border-none">
            {CampaignInfo.id}
          </Snippet>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-end">
          <Button onPress={() => {}} isDisabled={false} color="danger" variant="flat">
            Cancel Campaign
          </Button>
        </CardFooter>
      </Card>
    </Badge>
  );
}
