"use client";

import { useState } from "react";
import { AlertCircle, Info, XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function ComponentsPage() {
  const [progress, setProgress] = useState(45);
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <div className="min-h-screen bg-background py-12">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-urban text-4xl font-extrabold tracking-tight sm:text-5xl">
              Component Showcase
            </h1>
            <p className="text-lg text-muted-foreground">
              Test all components and their variants with the Soft Black &
              Silver theme
            </p>
          </div>

          {/* Buttons */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Buttons</h2>
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>All button variants and sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="disable" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <span>🔍</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Rounded</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button rounded="sm">Small</Button>
                    <Button rounded="default">Default</Button>
                    <Button rounded="lg">Large</Button>
                    <Button rounded="xl">XL</Button>
                    <Button rounded="2xl">2XL</Button>
                    <Button rounded="full">Full</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Silver Gradient</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-gradient-silver shadow-silver hover:shadow-silver-lg text-background">
                      Silver Gradient
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Cards</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card content goes here. This uses the card background color.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Border</CardTitle>
                  <CardDescription>Card with visible border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    This card demonstrates the border color from the theme.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle className="text-surface-foreground">
                    Surface Background
                  </CardTitle>
                  <CardDescription className="text-surface-foreground/70">
                    Using surface color
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-surface-foreground/80 text-sm">
                    This card uses the surface background color.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Badges */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Badges</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Alerts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Alerts</h2>
            <div className="space-y-3">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational alert message.
                </AlertDescription>
              </Alert>
              <Alert variant="default">
                <AlertCircle className="size-4" />
                <AlertTitle>Default</AlertTitle>
                <AlertDescription>
                  This is a default alert message.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  This is a destructive alert message.
                </AlertDescription>
              </Alert>
            </div>
          </section>

          {/* Form Elements */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Form Elements</h2>
            <Card>
              <CardHeader>
                <CardTitle>Inputs & Controls</CardTitle>
                <CardDescription>
                  All form input components and their states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="input-default">Default Input</Label>
                  <Input id="input-default" placeholder="Enter text..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-disabled">Disabled Input</Label>
                  <Input id="input-disabled" placeholder="Disabled" disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textarea">Textarea</Label>
                  <Textarea
                    id="textarea"
                    placeholder="Enter longer text..."
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Select</Label>
                  <Select defaultValue="option1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox" />
                  <Label htmlFor="checkbox" className="cursor-pointer">
                    Accept terms and conditions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="switch" />
                  <Label htmlFor="switch" className="cursor-pointer">
                    Enable notifications
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label>Radio Group</Label>
                  <RadioGroup defaultValue="option1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <Label htmlFor="r1" className="cursor-pointer">
                        Option 1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <Label htmlFor="r2" className="cursor-pointer">
                        Option 2
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="r3" />
                      <Label htmlFor="r3" className="cursor-pointer">
                        Option 3
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Slider</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Value: {sliderValue[0]}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Progress</Label>
                    <span className="text-sm text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgress(Math.max(0, progress - 10))}
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                    >
                      +10%
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tabs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Tabs</h2>
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="space-y-2">
                    <h3 className="text-lg font-semibold">Tab 1 Content</h3>
                    <p className="text-sm text-muted-foreground">
                      This is the content for tab 1.
                    </p>
                  </TabsContent>
                  <TabsContent value="tab2" className="space-y-2">
                    <h3 className="text-lg font-semibold">Tab 2 Content</h3>
                    <p className="text-sm text-muted-foreground">
                      This is the content for tab 2.
                    </p>
                  </TabsContent>
                  <TabsContent value="tab3" className="space-y-2">
                    <h3 className="text-lg font-semibold">Tab 3 Content</h3>
                    <p className="text-sm text-muted-foreground">
                      This is the content for tab 3.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Avatars */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Avatars</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-16">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Skeleton */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Skeleton</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-3">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Separator */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Separator</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm">Content above</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm">Content below</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Color Variables Display */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Color Variables</h2>
            <Card>
              <CardHeader>
                <CardTitle>Theme Colors</CardTitle>
                <CardDescription>
                  Visual representation of all CSS color variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-background" />
                    <p className="text-sm font-medium">background</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#FAFAFA</span>
                      <span className="hidden dark:inline">#0D0D0D</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md bg-foreground" />
                    <p className="text-sm font-medium">foreground</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#0D0D0D</span>
                      <span className="hidden dark:inline">#F5F5F5</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-card" />
                    <p className="text-sm font-medium">card</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#FFFFFF</span>
                      <span className="hidden dark:inline">#1A1A1A</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md bg-primary" />
                    <p className="text-sm font-medium">primary</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#6B6B6B</span>
                      <span className="hidden dark:inline">#C0C0C0</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-secondary" />
                    <p className="text-sm font-medium">secondary</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#F5F5F5</span>
                      <span className="hidden dark:inline">#1A1A1A</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-muted" />
                    <p className="text-sm font-medium">muted</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#F5F5F5</span>
                      <span className="hidden dark:inline">#1A1A1A</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-accent" />
                    <p className="text-sm font-medium">accent</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#E6E6E6</span>
                      <span className="hidden dark:inline">#E0E0E0</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md bg-destructive" />
                    <p className="text-sm font-medium">destructive</p>
                    <p className="text-xs text-muted-foreground">Red</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border" />
                    <p className="text-sm font-medium">border</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#E5E5E5</span>
                      <span className="hidden dark:inline">#2C2C2C</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-surface h-16 rounded-md border border-border" />
                    <p className="text-sm font-medium">surface</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#FFFFFF</span>
                      <span className="hidden dark:inline">#1A1A1A</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gradient-silver h-16 rounded-md" />
                    <p className="text-sm font-medium">silver gradient</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#6B6B6B → #A0A0A0</span>
                      <span className="hidden dark:inline">
                        #B0B0B0 → #E0E0E0
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-md border border-border bg-muted-foreground/10" />
                    <p className="text-sm font-medium">muted-foreground</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="dark:hidden">#737373</span>
                      <span className="hidden dark:inline">#A0A0A0</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
